import { ImageResponse } from '@vercel/og';
import { getCollection, type CollectionEntry } from 'astro:content';
import fs from 'fs';
import path from 'path';

type Props = {
  params: { slug: string };
  props: { post: CollectionEntry<'posts'> };
};

export async function GET({ props }: Props) {
  const { post } = props;

  // using custom font files
  const UncutSansMedium = fs.readFileSync(
    path.resolve(process.cwd(), 'public/fonts/UncutSans-Medium.otf'),
  );
  const UncutSansSemibold = fs.readFileSync(
    path.resolve(process.cwd(), 'public/fonts/UncutSans-Semibold.otf'),
  );

  const html = {
    type: 'div',
    key: null,
    props: {
      children: [
        {
          type: 'div',
          key: null,
          props: {
            tw: 'shrink flex flex-col',
            children: [
              {
                type: 'div',
                key: null,
                props: {
                  style: {
                    fontSize: '96px',
                    fontFamily: 'Uncut Sans Semibold',
                  },
                  children: post.data.title,
                },
              },
              {
                type: 'div',
                key: null,
                props: {
                  style: {
                    fontSize: '32px',
                    fontFamily: 'Uncut Sans Medium',
                  },
                  children: post.data.summary,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          key: null,
          props: {
            tw: 'absolute right-[40px] bottom-[40px] flex items-center',
            children: [
              {
                type: 'div',
                key: null,
                props: {
                  tw: 'text-blue-600 text-3xl font-medium',
                  style: {
                    fontFamily: 'Uncut Sans Medium',
                  },
                  children: 'Shovan Chatterjee',
                },
              },
              {
                type: 'div',
                key: null,
                props: {
                  tw: 'px-2 text-3xl',
                  style: {
                    fontSize: '30px',
                  },
                  children: '|',
                },
              },
              {
                type: 'div',
                key: null,
                props: {
                  tw: 'text-3xl',
                  children: 'Blog',
                },
              },
            ],
          },
        },
      ],
      tw: 'w-full h-full flex items-center justify-center relative px-22',
      style: {
        background: '#f7f8e8',
        fontFamily: 'Uncut Sans Medium',
      },
    },
  };

  return new ImageResponse(html, {
    width: 1200,
    height: 600,
    fonts: [
      {
        name: 'Uncut Sans Medium',
        data: UncutSansMedium,
        style: 'normal',
      },
      {
        name: 'Uncut Sans Semibold',
        data: UncutSansSemibold,
        style: 'normal',
      },
    ],
  });
}

// to generate an image for each blog posts in a collection
export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}
