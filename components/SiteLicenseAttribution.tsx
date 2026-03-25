import type { CSSProperties } from 'react';

const ccIconStyle: CSSProperties = {
  maxWidth: '1em',
  maxHeight: '1em',
  marginLeft: '.2em',
};

export default function SiteLicenseAttribution({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={className} style={style}>
      <a href="https://pixelplaceofficial.com/games">Pixel Place</a>
      {' © 2026 by '}
      <a href="https://github.com/Mainline-Studios">Mainline Studios</a>
      {' is licensed under '}
      <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/">CC BY-NC-ND 4.0</a>
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
  );
}
