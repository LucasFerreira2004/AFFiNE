import { notify } from '@affine/component';
import { useDowngradeNotify } from '@affine/core/components/affine/subscription-landing/notify';
import { getDowngradeQuestionnaireLink } from '@affine/core/components/hooks/affine/use-subscription-notify';
import { useAsyncCallback } from '@affine/core/components/hooks/affine-async-hooks';
import { SubscriptionPlan } from '@affine/graphql';
import { useI18n } from '@affine/i18n';
import { track } from '@affine/track';
import { useLiveData, useService } from '@toeverything/infra';
import { nanoid } from 'nanoid';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import {
  AuthService,
  SubscriptionService,
  WorkspaceSubscriptionService,
} from '../../../../../modules/cloud';
import {
  ConfirmLoadingModal,
  DowngradeModal,
  DowngradeTeamModal,
} from './modals';

const useSubscriptionAction = ({
  subscription,
  type,
  plan,
  onOpenChange,
  after,
}: {
  subscription: any;
  type: 'cancel' | 'resume';
  plan: SubscriptionPlan;
  onOpenChange: (open: boolean) => void;
  after?: () => void;
}) => {
  const [idempotencyKey, setIdempotencyKey] = useState(nanoid());
  const [isMutating, setIsMutating] = useState(false);

  const action = useAsyncCallback(async () => {
    try {
      setIsMutating(true);

      if (type === 'cancel') {
        await subscription.cancelSubscription(idempotencyKey, plan);
      } else {
        await subscription.resumeSubscription(idempotencyKey, plan);
      }

      await subscription.waitForRevalidation();
      setIdempotencyKey(nanoid());
      onOpenChange(false);

      after?.();
    } finally {
      setIsMutating(false);
    }
  }, [subscription, idempotencyKey, onOpenChange, after, type, plan]);

  return { isMutating, action };
};

export const CancelAction = ({
  children,
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & PropsWithChildren) => {
  const subscription = useService(SubscriptionService).subscription;
  const proSubscription = useLiveData(subscription.pro$);
  const auth = useService(AuthService);
  const downgradeNotify = useDowngradeNotify();

  useEffect(() => {
    if (open && proSubscription) {
      track.$.settingsPanel.plans.cancelSubscription({
        plan: proSubscription.plan,
        recurring: proSubscription.recurring,
      });
    }
  }, [open, proSubscription]);

  const { isMutating, action } = useSubscriptionAction({
    subscription,
    type: 'cancel',
    plan: SubscriptionPlan.Pro,
    onOpenChange,
    after: () => {
      const account = auth.session.account$.value;
      const prevRecurring = proSubscription?.recurring;

      const current = subscription.pro$.value;
      if (current) {
        track.$.settingsPanel.plans.confirmCancelingSubscription({
          plan: current.plan,
          recurring: current.recurring,
        });
      }

      if (account && prevRecurring) {
        downgradeNotify(
          getDowngradeQuestionnaireLink({
            email: account.email ?? '',
            id: account.id,
            name: account.info?.name ?? '',
            plan: SubscriptionPlan.Pro,
            recurring: prevRecurring,
          })
        );
      }
    },
  });

  return (
    <>
      {children}
      <DowngradeModal
        open={open}
        onCancel={action}
        onOpenChange={onOpenChange}
        loading={isMutating}
      />
    </>
  );
};

export const CancelTeamAction = ({
  children,
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & PropsWithChildren) => {
  const subscription = useService(WorkspaceSubscriptionService).subscription;
  const workspaceSubscription = useLiveData(subscription.subscription$);
  const auth = useService(AuthService);
  const downgradeNotify = useDowngradeNotify();

  const { isMutating, action } = useSubscriptionAction({
    subscription,
    type: 'cancel',
    plan: SubscriptionPlan.Team,
    onOpenChange,
    after: () => {
      const account = auth.session.account$.value;
      const prevRecurring = workspaceSubscription?.recurring;

      if (account && prevRecurring) {
        downgradeNotify(
          getDowngradeQuestionnaireLink({
            email: account.email ?? '',
            id: account.id,
            name: account.info?.name ?? '',
            plan: SubscriptionPlan.Team,
            recurring: prevRecurring,
          })
        );
      }
    },
  });

  if (workspaceSubscription?.canceledAt) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <DowngradeTeamModal
        open={open}
        onCancel={action}
        onOpenChange={onOpenChange}
        loading={isMutating}
      />
    </>
  );
};

export const ResumeAction = ({
  children,
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & PropsWithChildren) => {
  const subscription = useService(SubscriptionService).subscription;

  const { isMutating, action } = useSubscriptionAction({
    subscription,
    type: 'resume',
    plan: SubscriptionPlan.Pro,
    onOpenChange,
    after: () => {
      const current = subscription.pro$.value;
      if (current) {
        track.$.settingsPanel.plans.confirmResumingSubscription({
          plan: current.plan,
          recurring: current.recurring,
        });
      }
    },
  });

  return (
    <>
      {children}
      <ConfirmLoadingModal
        type="resume"
        open={open}
        onConfirm={action}
        onOpenChange={onOpenChange}
        loading={isMutating}
      />
    </>
  );
};

export const TeamResumeAction = ({
  children,
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & PropsWithChildren) => {
  const subscription = useService(WorkspaceSubscriptionService).subscription;
  const t = useI18n();

  const { isMutating, action } = useSubscriptionAction({
    subscription,
    type: 'resume',
    plan: SubscriptionPlan.Team,
    onOpenChange,
    after: () => {
      notify.success({
        title: t['com.affine.payment.resume.success.title'](),
        message: t['com.affine.payment.resume.success.team.message'](),
      });
    },
  });

  return (
    <>
      {children}
      <ConfirmLoadingModal
        type="resume"
        open={open}
        onConfirm={action}
        onOpenChange={onOpenChange}
        loading={isMutating}
      />
    </>
  );
};
