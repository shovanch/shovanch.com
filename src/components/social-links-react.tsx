import { useState } from 'react';
import { socialLinks } from '~/config/site';

// React icon components with the exact same SVGs as the Astro versions
const EmailIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className={className}
  >
    <path d="M112 128C85.5 128 64 149.5 64 176C64 191.1 71.1 205.3 83.2 214.4L291.2 370.4C308.3 383.2 331.7 383.2 348.8 370.4L556.8 214.4C568.9 205.3 576 191.1 576 176C576 149.5 554.5 128 528 128L112 128zM64 260L64 448C64 483.3 92.7 512 128 512L512 512C547.3 512 576 483.3 576 448L576 260L377.6 408.8C343.5 434.4 296.5 434.4 262.4 408.8L64 260z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className={className}
  >
    <path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM447.3 263.3C447.3 350 381.3 449.9 260.7 449.9C223.5 449.9 189 439.1 160 420.5C165.3 421.1 170.4 421.3 175.8 421.3C206.5 421.3 234.7 410.9 257.2 393.3C228.4 392.7 204.2 373.8 195.9 347.8C206 349.3 215.1 349.3 225.5 346.6C195.5 340.5 173 314.1 173 282.2L173 281.4C181.7 286.3 191.9 289.3 202.6 289.7C193.6 283.7 186.2 275.6 181.1 266.1C176 256.6 173.3 245.9 173.4 235.1C173.4 222.9 176.6 211.7 182.3 202C214.6 241.8 263.1 267.8 317.5 270.6C308.2 226.1 341.5 190 381.5 190C400.4 190 417.4 197.9 429.4 210.7C444.2 207.9 458.4 202.4 471 194.9C466.1 210.1 455.8 222.9 442.2 231C455.4 229.6 468.2 225.9 480 220.8C471.1 233.9 459.9 245.5 447.1 254.8C447.3 257.6 447.3 260.5 447.3 263.3z" />
  </svg>
);

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className={className}
  >
    <path d="M544 160C544 124.7 515.3 96 480 96L160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160zM361.8 471.7C361.8 469.9 361.8 465.7 361.9 460.1C362 448.7 362 431.3 362 416.4C362 400.8 356.8 390.9 350.7 385.7C387.7 381.6 426.7 376.5 426.7 312.6C426.7 294.4 420.2 285.3 409.6 273.6C411.3 269.3 417 251.6 407.9 228.6C394 224.3 362.2 246.5 362.2 246.5C335.6 239 305.6 239 279 246.5C279 246.5 247.2 224.3 233.3 228.6C224.2 251.5 229.8 269.2 231.6 273.6C221 285.3 216 294.4 216 312.6C216 376.2 253.3 381.6 290.3 385.7C285.5 390 281.2 397.4 279.7 408C270.2 412.3 245.9 419.7 231.4 394.1C222.3 378.3 205.9 377 205.9 377C189.7 376.8 204.8 387.2 204.8 387.2C215.6 392.2 223.2 411.4 223.2 411.4C232.9 441.1 279.3 431.1 279.3 431.1C279.3 440.1 279.4 452.8 279.4 461.7C279.4 466.5 279.5 470.3 279.5 471.7C279.5 476 276.5 481.2 268 479.7C202 457.6 155.8 394.8 155.8 321.4C155.8 229.6 226 159.9 317.8 159.9C409.6 159.9 484 229.6 484 321.4C484.1 394.8 439.3 457.7 373.3 479.7C364.9 481.2 361.8 476 361.8 471.7zM271.3 416.9C271.1 415.4 272.4 414.1 274.3 413.7C276.2 413.5 278 414.3 278.2 415.6C278.5 416.9 277.2 418.2 275.2 418.6C273.3 419 271.5 418.2 271.3 416.9zM262.2 420.1C260 420.3 258.5 419.2 258.5 417.7C258.5 416.4 260 415.3 262 415.3C263.9 415.1 265.7 416.2 265.7 417.7C265.7 419 264.2 420.1 262.2 420.1zM247.9 417.9C246 417.5 244.7 416 245.1 414.7C245.5 413.4 247.5 412.8 249.2 413.2C251.2 413.8 252.5 415.3 252 416.6C251.6 417.9 249.6 418.5 247.9 417.9zM235.4 410.6C233.9 409.3 233.5 407.4 234.5 406.5C235.4 405.4 237.3 405.6 238.8 407.1C240.1 408.4 240.6 410.4 239.7 411.2C238.8 412.3 236.9 412.1 235.4 410.6zM226.9 400.6C225.8 399.1 225.8 397.4 226.9 396.7C228 395.8 229.7 396.5 230.6 398C231.7 399.5 231.7 401.3 230.6 402.1C229.7 402.7 228 402.1 226.9 400.6zM220.6 391.8C219.5 390.5 219.3 389 220.2 388.3C221.1 387.4 222.6 387.9 223.7 388.9C224.8 390.2 225 391.7 224.1 392.4C223.2 393.3 221.7 392.8 220.6 391.8zM214.6 385.4C213.3 384.8 212.7 383.7 213.1 382.8C213.5 382.2 214.6 381.9 215.9 382.4C217.2 383.1 217.8 384.2 217.4 385C217 385.9 215.7 386.1 214.6 385.4z" />
  </svg>
);

const RSSIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className={className}
  >
    <path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 160C544 124.7 515.3 96 480 96L160 96zM192 200C192 186.7 202.7 176 216 176C353 176 464 287 464 424C464 437.3 453.3 448 440 448C426.7 448 416 437.3 416 424C416 313.5 326.5 224 216 224C202.7 224 192 213.3 192 200zM192 296C192 282.7 202.7 272 216 272C299.9 272 368 340.1 368 424C368 437.3 357.3 448 344 448C330.7 448 320 437.3 320 424C320 366.6 273.4 320 216 320C202.7 320 192 309.3 192 296zM192 416C192 398.3 206.3 384 224 384C241.7 384 256 398.3 256 416C256 433.7 241.7 448 224 448C206.3 448 192 433.7 192 416z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 640 640"
    className={className}
  >
    <path d="M512 96L127.9 96C110.3 96 96 110.5 96 128.3L96 511.7C96 529.5 110.3 544 127.9 544L512 544C529.6 544 544 529.5 544 511.7L544 128.3C544 110.5 529.6 96 512 96zM231.4 480L165 480L165 266.2L231.5 266.2L231.5 480L231.4 480zM198.2 160C219.5 160 236.7 177.2 236.7 198.5C236.7 219.8 219.5 237 198.2 237C176.9 237 159.7 219.8 159.7 198.5C159.7 177.2 176.9 160 198.2 160zM480.3 480L413.9 480L413.9 376C413.9 351.2 413.4 319.3 379.4 319.3C344.8 319.3 339.5 346.3 339.5 374.2L339.5 480L273.1 480L273.1 266.2L336.8 266.2L336.8 295.4L337.7 295.4C346.6 278.6 368.3 260.9 400.6 260.9C467.8 260.9 480.3 305.2 480.3 362.8L480.3 480z" />
  </svg>
);

const getIconComponent = (label: string) => {
  switch (label) {
    case 'email':
      return EmailIcon;
    case 'twitter':
      return TwitterIcon;
    case 'github':
      return GitHubIcon;
    case 'rss':
      return RSSIcon;
    case 'linkedin':
      return LinkedInIcon;
    default:
      return null;
  }
};

const getDisplayName = (label: string) => {
  switch (label) {
    case 'github':
      return 'GitHub';
    case 'linkedin':
      return 'LinkedIn';
    case 'twitter':
      return 'Twitter';
    case 'rss':
      return 'RSS';
    case 'email':
      return 'Copy Email';
    default:
      return label;
  }
};

const getRotationClass = (label: string) => {
  switch (label) {
    case 'email':
      return 'rotate-[-3deg]';
    case 'github':
      return 'rotate-[1.5deg]';
    case 'linkedin':
      return 'rotate-[0deg]';
    case 'twitter':
      return 'rotate-[-2deg]';
    case 'rss':
      return 'rotate-[2deg]';
    default:
      return '';
  }
};

export function SocialLinksReact() {
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    text: string;
    success: boolean;
  }>({
    show: false,
    text: '',
    success: false,
  });

  const copyEmail = async (email: string) => {
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported');
      }

      await navigator.clipboard.writeText(email.replace('mailto:', ''));
      setTooltip({ show: true, text: 'Email copied', success: true });
      setTimeout(() => {
        setTooltip({ show: false, text: '', success: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy email: ', err);
      setTooltip({ show: true, text: 'Copy failed', success: false });
      setTimeout(() => {
        setTooltip({ show: false, text: '', success: false });
      }, 2000);
    }
  };

  return (
    <div className="flex flex-row flex-wrap gap-x-4 gap-y-2">
      {socialLinks.map((link) => {
        const IconComponent = getIconComponent(link.label);
        const isEmail = link.label === 'email';
        const displayName = getDisplayName(link.label);
        const rotationClass = getRotationClass(link.label);

        if (!IconComponent) {
          return (
            <a
              key={link.url}
              href={link.url}
              className="text-theme-link hover:text-theme-link-hover font-sans font-semibold decoration-wavy underline-offset-2 hover:underline md:text-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          );
        }

        if (isEmail) {
          return (
            <button
              key={link.url}
              onClick={() => copyEmail(link.url)}
              className={`text-theme-link hover:!text-theme-link-hover relative inline-flex cursor-pointer items-center justify-center border-none !bg-transparent !p-0 opacity-100 transition-all duration-200 ease-in-out hover:scale-110 hover:rotate-0 hover:!bg-transparent dark:text-white ${rotationClass}`}
              aria-label="Copy email address"
              onMouseEnter={() =>
                setTooltip({ show: true, text: displayName, success: false })
              }
              onMouseLeave={() =>
                setTooltip({ show: false, text: '', success: false })
              }
            >
              <IconComponent className="h-8 w-8 fill-current md:h-10 md:w-10" />
              {tooltip.show && (
                <span
                  className={`pointer-events-none absolute bottom-full left-1/2 z-[1000] mb-2 -translate-x-1/2 rounded px-2 py-1 font-sans text-xs whitespace-nowrap transition-all duration-200 ease-in-out ${
                    tooltip.success
                      ? 'bg-green-500 text-white'
                      : 'bg-theme-text text-theme-bg'
                  }`}
                >
                  {tooltip.text}
                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${
                      tooltip.success
                        ? 'border-t-green-500'
                        : 'border-t-theme-text'
                    }`}
                  />
                </span>
              )}
            </button>
          );
        }

        return (
          <a
            key={link.url}
            href={link.url}
            className={`text-theme-link/95 hover:!text-theme-link-hover relative inline-flex items-center justify-center !bg-transparent !p-0 opacity-100 transition-all duration-200 ease-in-out hover:scale-110 hover:rotate-0 hover:!bg-transparent ${rotationClass}`}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() =>
              setTooltip({ show: true, text: displayName, success: false })
            }
            onMouseLeave={() =>
              setTooltip({ show: false, text: '', success: false })
            }
          >
            <IconComponent className="h-8 w-8 fill-current md:h-10 md:w-10" />
            {tooltip.show && (
              <span className="bg-theme-text text-theme-bg pointer-events-none absolute bottom-full left-1/2 z-[1000] mb-2 -translate-x-1/2 rounded px-2 py-1 font-sans text-xs whitespace-nowrap transition-all duration-200 ease-in-out">
                {tooltip.text}
                <div className="border-t-theme-text absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" />
              </span>
            )}
          </a>
        );
      })}
    </div>
  );
}
