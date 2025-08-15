import clsx from 'clsx';

type BookCoverProps = {
  src: string;
  alt: string;
  size?: 'small' | 'large';
  className?: string;
};

export function BookCover({
  src,
  alt,
  size = 'small',
  className,
}: BookCoverProps) {
  // Height constraints based on size
  const heightClasses = {
    small: 'h-24 md:h-32',
    large: 'h-48 md:h-64',
  };

  return (
    <div className="not-prose flex w-full flex-col items-start md:items-center">
      <div className="mb-6 self-center">
        <div
          className={clsx(
            'relative cursor-default break-inside-avoid p-4',
            className,
          )}
        >
          <div className="relative">
            {/* Book Inside - Creates the depth/page effect */}
            <div className="absolute top-[1%] left-4 h-[96%] w-[90%] rounded-r-md border border-gray-400 bg-white shadow-[10px_40px_40px_-10px_rgba(0,0,0,0.19),_-2px_0px_0px_inset_gray,_-3px_0px_0px_inset_#dbdbdb,_-4px_0px_0px_inset_white,_-5px_0px_0px_inset_#dbdbdb,_-6px_0px_0px_inset_white,_-7px_0px_0px_inset_#dbdbdb,_-8px_0px_0px_inset_white,_-9px_0px_0px_inset_#dbdbdb]" />

            {/* Main Book Cover */}
            <div className="relative -translate-x-2.5 scale-x-[0.94] -rotate-y-[15deg] transform cursor-pointer rounded-r-md leading-none shadow-[6px_6px_18px_-2px_rgba(0,0,0,0.2),_24px_28px_40px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out perspective-[2000px] hover:-translate-x-0 hover:scale-x-100 hover:rotate-y-0 hover:transform-gpu hover:shadow-[6px_6px_12px_-1px_rgba(0,0,0,0.1),_20px_14px_16px_-6px_rgba(0,0,0,0.1)] dark:shadow-[6px_6px_18px_-2px_rgba(255,255,255,0.15),_24px_28px_40px_-6px_rgba(255,255,255,0.08)] dark:hover:shadow-[6px_6px_12px_-1px_rgba(255,255,255,0.12),_20px_14px_16px_-6px_rgba(255,255,255,0.06)]">
              <div className="relative cursor-pointer rounded-r-md leading-none">
                {/* Container maintains aspect ratio while respecting height constraints */}
                <div
                  className={clsx(
                    'relative overflow-hidden rounded-r-md',
                    heightClasses[size],
                  )}
                >
                  <img
                    alt={alt}
                    className="not-prose h-full w-auto object-fill object-center"
                    loading="lazy"
                    src={src}
                  />

                  {/* Light overlay */}
                  <div className="absolute top-0 right-0 z-[4] h-full w-[90%] rounded-sm bg-gradient-to-r from-white/0 to-white/20 opacity-10 transition-all duration-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
