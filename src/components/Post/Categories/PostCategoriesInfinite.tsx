import { PostCategoryCard } from './PostCategoryCard';
import { usePostFilters, useQueryPostCategories } from '~/components/Post/post.utils';
import { removeEmpty } from '~/utils/object-helpers';
import { IconArrowRight, IconPlus } from '@tabler/icons';
import { CategoryList } from '~/components/CategoryList/CategoryList';
import { Center, Text, Stack } from '@mantine/core';
import { NextLink } from '@mantine/next';

type PostCategoriesState = {
  username?: string;
  modelId?: number;
  modelVersionId?: number;
};

export function PostCategoriesInfinite({
  filters: filterOverrides = {},
  limit = 6,
}: {
  filters?: PostCategoriesState;
  limit?: number;
}) {
  const globalFilters = usePostFilters();
  const filters = removeEmpty({ ...globalFilters, ...filterOverrides, limit, tags: undefined });

  const { categories, isLoading, isRefetching, fetchNextPage, hasNextPage } =
    useQueryPostCategories(filters);
  if (!categories) return null;

  return (
    <CategoryList
      data={categories}
      render={PostCategoryCard}
      isLoading={isLoading}
      isRefetching={isRefetching}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      empty={({ id }) => (
        <Center style={{ height: '100%' }}>
          <Stack align="center">
            <Text size={32} align="center">
              No posts found
            </Text>
            <Text align="center">
              Try adjusting your filters or{' '}
              <Text component={NextLink} href={`/posts/create?tag=${id}`} variant="link">
                make a post
              </Text>
            </Text>
          </Stack>
        </Center>
      )}
      actions={(items) => [
        {
          label: 'View more',
          href: (category) => `/posts?tags=${category.id}&view=feed`,
          icon: <IconArrowRight />,
          inTitle: true,
          visible: !!items.length,
        },
        {
          label: 'Make post',
          href: (category) => `/posts/create?tag=${category.id}`,
          icon: <IconPlus />,
          inTitle: true,
        },
      ]}
    />
  );
}
