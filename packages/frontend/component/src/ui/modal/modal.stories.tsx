import type { Meta, StoryFn } from '@storybook/react';
import { useCallback, useState } from 'react';

import { Button } from '../button';
import type { InputProps } from '../input';
import { Input } from '../input';
import { RadioGroup } from '../radio';
import type { ConfirmModalProps } from './confirm-modal';
import { ConfirmModal } from './confirm-modal';
import type { ModalProps } from './modal';
import { Modal } from './modal';
import type { OverlayModalProps } from './overlay-modal';
import { OverlayModal } from './overlay-modal';

export default {
  title: 'UI/Modal',
  component: Modal,
  argTypes: {},
} satisfies Meta<ModalProps>;

const Template: StoryFn<ModalProps> = args => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal open={open} onOpenChange={setOpen} {...args} />
    </>
  );
};

export const Default: StoryFn<ModalProps> = Template.bind(undefined);
Default.args = {
  title: 'Modal Title',
  description:
    'If the day is done, if birds sing no more, if the wind has flagged tired, then draw the veil of darkness thick upon me, even as thou hast wrapt the earth with the coverlet of sleep and tenderly closed the petals of the drooping lotus at dusk.',
};

const wait = () => new Promise(resolve => setTimeout(resolve, 1000));

const ConfirmModalTemplate: StoryFn<ConfirmModalProps> = () => {
  const [state, setState] = useState({
    open: false,
    loading: false,
    inputStatus: 'default' as InputProps['status'],
  });

  const setOpen = (val: boolean) => setState(prev => ({ ...prev, open: val }));

  const handleConfirm = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    await wait();
    setState(prev => ({
      ...prev,
      inputStatus: prev.inputStatus !== 'error' ? 'error' : 'success',
      loading: false,
    }));
  }, [state.inputStatus]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Confirm Modal</Button>
      <ConfirmModal
        open={state.open}
        onOpenChange={setOpen}
        onConfirm={handleConfirm}
        title="Modal Title"
        description="Modal description"
        confirmText="Confirm"
        confirmButtonOptions={{
          loading: state.loading,
          variant: 'primary',
        }}
      >
        <Input placeholder="input someting" status={state.inputStatus} />
      </ConfirmModal>
    </>
  );
};

const OverlayModalTemplate: StoryFn<OverlayModalProps> = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Overlay Modal</Button>
      <OverlayModal
        open={open}
        onOpenChange={setOpen}
        title="Modal Title"
        description="Modal description"
        confirmButtonOptions={{
          variant: 'primary',
        }}
        topImage={
          <div
            style={{
              width: '400px',
              height: '300px',
              background: '#66ccff',
              opacity: 0.1,
              color: '#fff',
            }}
          ></div>
        }
      />
    </>
  );
};

export const Confirm: StoryFn<ModalProps> =
  ConfirmModalTemplate.bind(undefined);

export const Overlay: StoryFn<ModalProps> =
  OverlayModalTemplate.bind(undefined);

export const Animations = () => {
  const animations: ModalProps['animation'][] = [
    'fadeScaleTop',
    'slideBottom',
    'none',
  ];

  const [state, setState] = useState({
    open: false,
    animation: 'fadeScaleTop' as ModalProps['animation'],
  });

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <RadioGroup
        value={state.animation}
        onChange={val => setState(prev => ({ ...prev, animation: val }))}
        items={animations}
      />
      <Button onClick={() => setState(prev => ({ ...prev, open: true }))}>
        Open dialog
      </Button>
      <Modal
        contentWrapperStyle={
          state.animation === 'slideBottom'
            ? { alignItems: 'end', padding: 10 }
            : {}
        }
        open={state.open}
        onOpenChange={val => setState(prev => ({ ...prev, open: val }))}
        animation={state.animation}
      >
        This is a dialog with animation: {state.animation}
      </Modal>
    </div>
  );
};

export const Nested = () => {
  const [state, setState] = useState({
    openRoot: false,
    openNested: false,
  });

  return (
    <>
      <Button onClick={() => setState(prev => ({ ...prev, openRoot: true }))}>
        Open Root Modal
      </Button>
      <Modal
        animation="slideBottom"
        open={state.openRoot}
        onOpenChange={val => setState(prev => ({ ...prev, openRoot: val }))}
        contentOptions={{
          style: {
            transition: 'all .3s ease 0.1s',
            transform: state.openNested
              ? `scale(0.95) translateY(-20px)`
              : 'scale(1) translateY(0)',
          },
        }}
      >
        <Button
          onClick={() => setState(prev => ({ ...prev, openNested: true }))}
        >
          Open Nested Modal
        </Button>
      </Modal>
      <Modal
        animation="slideBottom"
        open={state.openNested}
        onOpenChange={val => setState(prev => ({ ...prev, openNested: val }))}
        overlayOptions={{ style: { background: 'transparent' } }}
      >
        Nested Modal
      </Modal>
    </>
  );
};
