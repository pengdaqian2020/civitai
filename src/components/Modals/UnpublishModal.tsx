import { Button, Group, Radio, Stack, Textarea } from '@mantine/core';
import React, { useState } from 'react';

import { createContextModal } from '~/components/Modals/utils/createContextModal';
import { UnpublishReason, unpublishReasons } from '~/server/common/moderation-helpers';
import { showErrorNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

const reasonOptions = Object.entries(unpublishReasons).map(([key, { optionLabel }]) => ({
  value: key,
  label: optionLabel,
}));

const { openModal, Modal } = createContextModal<{ modelId: number }>({
  name: 'unpublishModel',
  title: 'Unpublish as Violation',
  Element: ({ context, props: { modelId } }) => {
    const queryUtils = trpc.useContext();
    const [reason, setReason] = useState<UnpublishReason | undefined>();
    const [customMessage, setCustomMessage] = useState<string>('');
    const [error, setError] = useState<string>('');

    const unpublishMutation = trpc.model.unpublish.useMutation({
      onSuccess: async () => {
        await queryUtils.model.getById.invalidate({ id: modelId });
        await queryUtils.model.getAll.invalidate();
        context.close();
      },
      onError: (error) => {
        showErrorNotification({
          title: 'Failed to unpublish',
          error: new Error(error.message),
          reason: 'An unexpected error occurred. Please try again later.',
        });
      },
    });
    const handleUnpublish = () => {
      setError('');
      if (reason === 'other') {
        if (!customMessage) return setError('Required');
        return unpublishMutation.mutate({ id: modelId, reason, customMessage });
      }

      return unpublishMutation.mutate({ id: modelId, reason });
    };

    return (
      <Stack>
        <Radio.Group
          orientation="vertical"
          value={reason}
          onChange={(value: UnpublishReason) => setReason(value)}
        >
          {reasonOptions.map((reason) => (
            <Radio key={reason.value} value={reason.value} label={reason.label} />
          ))}
        </Radio.Group>
        {reason && (
          <>
            {reason === 'other' && (
              <Textarea
                name="customMessage"
                label="Reason"
                placeholder="Why is this being unpublished?"
                rows={2}
                value={customMessage}
                onChange={(event) => setCustomMessage(event.currentTarget.value)}
                error={error}
                withAsterisk
              />
            )}
            <Group position="right">
              <Button onClick={handleUnpublish} loading={unpublishMutation.isLoading}>
                Unpublish
              </Button>
            </Group>
          </>
        )}
      </Stack>
    );
  },
});

export const openUnpublishModal = openModal;
export default Modal;
