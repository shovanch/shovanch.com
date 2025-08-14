import { ImageResponse } from '@vercel/og';
import fs from 'node:fs';
import path from 'node:path';
import { defaultMeta } from '~/config/site';

export async function GET() {
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
            tw: 'shrink flex flex-col space-y-4',
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '96px',
                    fontFamily: 'Uncut Sans Semibold',
                  },
                  children: 'shovanch.com',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '32px',
                    fontFamily: 'Uncut Sans Medium',
                  },
                  children: defaultMeta.description,
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            tw: 'absolute right-[40px] bottom-[40px] flex items-center',
            children: [
              {
                type: 'div',
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

  return new ImageResponse(html as any, {
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
