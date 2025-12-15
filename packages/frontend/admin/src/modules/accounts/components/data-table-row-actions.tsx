import { Button } from '@affine/admin/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@affine/admin/components/ui/dropdown-menu';
import {
  AccountBanIcon,
  DeleteIcon,
  EditIcon,
  LockIcon,
  MoreHorizontalIcon,
} from '@blocksuite/icons/rc';
import { useCallback, useReducer } from 'react';
import { toast } from 'sonner';

import { useRightPanel } from '../../panel/context';
import type { UserType } from '../schema';
import { DeleteAccountDialog } from './delete-account';
import { DisableAccountDialog } from './disable-account';
import { DiscardChanges } from './discard-changes';
import { EnableAccountDialog } from './enable-account';
import { ResetPasswordDialog } from './reset-password';
import {
  useDeleteUser,
  useDisableUser,
  useEnableUser,
  useResetUserPassword,
} from './use-user-management';
import { UpdateUserForm } from './user-form';

type DialogType =
  | 'delete'
  | 'resetPassword'
  | 'disable'
  | 'enable'
  | 'discard'
  | null;

type DialogState = { open: DialogType };

type DialogAction =
  | { type: 'OPEN'; dialog: DialogType }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE'; dialog: DialogType };

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case 'OPEN':
      return { open: action.dialog };
    case 'CLOSE':
      return { open: null };
    case 'TOGGLE':
      return { open: state.open === action.dialog ? null : action.dialog };
    default:
      return state;
  }
}

interface DataTableRowActionsProps {
  user: UserType;
}

export function DataTableRowActions({ user }: DataTableRowActionsProps) {
  const [state, dispatch] = useReducer(dialogReducer, { open: null });

  const { openPanel, isOpen, closePanel, setPanelContent } = useRightPanel();

  const deleteUser = useDeleteUser();
  const disableUser = useDisableUser();
  const enableUser = useEnableUser();
  const { resetPasswordLink, onResetPassword } = useResetUserPassword();

  const openDialog = (dialog: DialogType) => dispatch({ type: 'OPEN', dialog });

  const closeDialog = () => dispatch({ type: 'CLOSE' });

  const isOpenDialog = (dialog: DialogType) => state.open === dialog;

  const openResetPasswordDialog = useCallback(() => {
    onResetPassword(user.id, () => openDialog('resetPassword')).catch(e =>
      console.error(e)
    );
  }, [onResetPassword, user.id]);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(resetPasswordLink)
      .then(() => {
        toast('Reset password link copied');
        closeDialog();
      })
      .catch(e => {
        toast.error('Failed to copy: ' + e.message);
      });
  }, [resetPasswordLink]);

  const handleDelete = useCallback(() => {
    deleteUser(user.id, closeDialog);
  }, [deleteUser, user.id]);

  const handleDisable = useCallback(() => {
    disableUser(user.id, closeDialog);
  }, [disableUser, user.id]);

  const handleEnable = useCallback(() => {
    enableUser(user.id, closeDialog);
  }, [enableUser, user.id]);

  const handleConfirm = useCallback(() => {
    setPanelContent(
      <UpdateUserForm
        user={user}
        onComplete={closePanel}
        onResetPassword={openResetPasswordDialog}
        onDeleteAccount={() => openDialog('delete')}
      />
    );

    if (isOpenDialog('discard')) closeDialog();
    if (!isOpen) openPanel();
  }, [
    closePanel,
    isOpen,
    openPanel,
    setPanelContent,
    user,
    openResetPasswordDialog,
  ]);

  const handleEdit = useCallback(() => {
    if (isOpen) {
      openDialog('discard');
    } else {
      handleConfirm();
    }
  }, [isOpen, handleConfirm]);

  return (
    <div className="flex justify-end items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-8 w-8 p-0">
            <MoreHorizontalIcon fontSize={20} />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-[214px] p-[5px] gap-2">
          <DropdownMenuItem onSelect={handleEdit}>
            <EditIcon fontSize={20} /> Edit
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={openResetPasswordDialog}>
            <LockIcon fontSize={20} />
            {user.hasPassword ? 'Reset Password' : 'Setup Account'}
          </DropdownMenuItem>

          {user.disabled && (
            <DropdownMenuItem onSelect={() => openDialog('enable')}>
              <AccountBanIcon fontSize={20} /> Enable Email
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {!user.disabled && (
            <DropdownMenuItem
              className="text-red-500"
              onSelect={() => openDialog('disable')}
            >
              <AccountBanIcon fontSize={20} />
              Disable & Delete data
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="text-red-500"
            onSelect={() => openDialog('delete')}
          >
            <DeleteIcon fontSize={20} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAccountDialog
        email={user.email}
        open={isOpenDialog('delete')}
        onClose={closeDialog}
        onDelete={handleDelete}
      />

      <DisableAccountDialog
        email={user.email}
        open={isOpenDialog('disable')}
        onClose={closeDialog}
        onDisable={handleDisable}
      />

      <EnableAccountDialog
        email={user.email}
        open={isOpenDialog('enable')}
        onClose={closeDialog}
        onConfirm={handleEnable}
      />

      <ResetPasswordDialog
        link={resetPasswordLink}
        open={isOpenDialog('resetPassword')}
        onOpenChange={() => {}}
        onCopy={handleCopy}
      />

      <DiscardChanges
        open={isOpenDialog('discard')}
        onClose={closeDialog}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
