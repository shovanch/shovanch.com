import { Resvg, initWasm } from '@resvg/resvg-wasm';
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';

type OgImageOptions = {
  title: string;
  description?: string;
};

// Track initialization state
let wasmInitialized = false;
let fontsLoaded = false;
let UncutSansMedium: Buffer;
let UncutSansSemibold: Buffer;

async function ensureWasmInitialized() {
  if (wasmInitialized) return;

  // Load WASM from node_modules
  const wasmPath = path.resolve(
    process.cwd(),
    'node_modules/@resvg/resvg-wasm/index_bg.wasm',
  );
  const wasmBuffer = fs.readFileSync(wasmPath);
  await initWasm(wasmBuffer);
  wasmInitialized = true;
}

function loadFonts() {
  if (fontsLoaded) return;

  UncutSansMedium = fs.readFileSync(
    path.resolve(process.cwd(), 'public/fonts/UncutSans-Medium.otf'),
  );
  UncutSansSemibold = fs.readFileSync(
    path.resolve(process.cwd(), 'public/fonts/UncutSans-Semibold.otf'),
  );
  fontsLoaded = true;
}

export async function generateOgImage({
  title,
  description,
}: OgImageOptions): Promise<Uint8Array> {
  await ensureWasmInitialized();
  loadFonts();

  const svg = await satori(
    {
      type: 'div',
      props: {
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 1,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '96px',
                      fontFamily: 'Uncut Sans Semibold',
                    },
                    children: title,
                  },
                },
                description
                  ? {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '32px',
                          fontFamily: 'Uncut Sans Medium',
                        },
                        children: description,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                right: '40px',
                bottom: '40px',
                display: 'flex',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      color: '#2563eb',
                      fontSize: '30px',
                      fontFamily: 'Uncut Sans Medium',
                    },
                    children: 'Shovan Chatterjee',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      padding: '0 8px',
                      fontSize: '30px',
                    },
                    children: '|',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '30px',
                    },
                    children: 'Blog',
                  },
                },
              ],
            },
          },
        ],
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0 88px',
          background: '#f7f8e8',
          fontFamily: 'Uncut Sans Medium',
        },
      },
    },
    {
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
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
