import { AssociationType } from '@prisma/client';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { trpc } from '~/utils/trpc';
import {
  LoadingOverlay,
  Stack,
  Title,
  Container,
  Group,
  Button,
  Center,
  Text,
  Box,
  Paper,
  ThemeIcon,
} from '@mantine/core';
import { MasonryProvider } from '~/components/MasonryColumns/MasonryProvider';
import { MasonryContainer } from '~/components/MasonryColumns/MasonryContainer';
import { MasonryCarousel } from '~/components/MasonryColumns/MasonryCarousel';
import { ModelCategoryCard } from '~/components/Model/Categories/ModelCategoryCard';
import { openContext } from '~/providers/CustomModalsProvider';
import { IconRocketOff } from '@tabler/icons';

export function AssociatedModels({
  fromId,
  type,
  label,
  ownerId,
}: {
  fromId: number;
  type: AssociationType;
  label: string;
  ownerId: number;
}) {
  const currentUser = useCurrentUser();
  const isOwnerOrModerator = currentUser?.isModerator || currentUser?.id === ownerId;

  const { data = [], isLoading } = trpc.model.getAssociatedModelsCardData.useQuery({
    fromId,
    type,
  });

  const handleManageClick = () => {
    openContext('associateModels', { fromId, type });
  };

  if (!isOwnerOrModerator && !data.length) return null;

  return (
    <MasonryProvider columnWidth={310} maxColumnCount={4} maxSingleColumnWidth={450}>
      <MasonryContainer
        fluid
        my="xl"
        pt="xl"
        pb="xl"
        sx={(theme) => ({
          background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
        })}
      >
        {({ columnWidth, columnCount }) => (
          <Stack pb={columnCount > 1 && data.length ? 20 : undefined}>
            <Group>
              <Title order={2}>{label}</Title>
              {isOwnerOrModerator && (
                <Button size="xs" variant="outline" onClick={handleManageClick}>
                  Manage {type} Resources
                </Button>
              )}
            </Group>
            {isLoading ? (
              <div style={{ position: 'relative', height: 310 }}>
                <LoadingOverlay visible />
              </div>
            ) : data.length ? (
              <MasonryCarousel
                data={data}
                render={ModelCategoryCard}
                height={columnWidth}
                itemId={(x) => x.id}
              />
            ) : (
              <Group spacing="xs" mt="xs">
                <ThemeIcon color="gray" size="xl" radius="xl">
                  <IconRocketOff />
                </ThemeIcon>
                <Text size="lg" color="dimmed">
                  {`You aren't suggesting any other resources yet...`}
                </Text>
              </Group>
            )}
          </Stack>
        )}
      </MasonryContainer>
    </MasonryProvider>
  );
}
