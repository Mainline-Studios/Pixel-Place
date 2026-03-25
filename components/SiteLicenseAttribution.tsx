import type { CSSProperties } from 'react';

const ccIconStyle: CSSProperties = {
  maxWidth: '1em',
  maxHeight: '1em',
  display: 'block',
};

const wrapStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  columnGap: '0.35em',
  rowGap: '0.5em',
  textAlign: 'center',
};

const textStyle: CSSProperties = {
  display: 'inline',
  textAlign: 'center',
};

const iconsStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  flexShrink: 0,
};

export default function SiteLicenseAttribution({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={className} style={{ ...wrapStyle, ...style }}>
      <span style={textStyle}>
        <a href="https://pixelplaceofficial.com/games">Pixel Place</a>
        {' © 2026 by '}
        <a href="https://github.com/Mainline-Studios">Mainline Studios</a>
        {' is licensed under '}
        <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CC BY-NC-ND 4.0</a>
      </span>
      <span style={iconsStyle} aria-hidden>
        <img
          src="https://mirrors.creativecommons.org/presskit/icons/cc.svg"
          alt=""
          style={ccIconStyle}
        />
        <img
          src="https://mirrors.creativecommons.org/presskit/icons/by.svg"
          alt=""
          style={ccIconStyle}
        />
        <img
          src="https://mirrors.creativecommons.org/presskit/icons/nc.svg"
          alt=""
          style={ccIconStyle}
        />
        <img
          src="https://mirrors.creativecommons.org/presskit/icons/nd.svg"
          alt=""
          style={ccIconStyle}
        />
      </span>
    </span>
  );
}
