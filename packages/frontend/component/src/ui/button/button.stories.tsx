import {
  AfFiNeIcon,
  ArrowRightBigIcon,
  FolderIcon,
} from '@blocksuite/icons/rc';
import type { Meta } from '@storybook/react';
import clsx from 'clsx';
import { useCallback, useEffect, useReducer, useState } from 'react';

import { Switch } from '../switch';
import type { ButtonProps } from './button';
import { Button } from './button';
import * as styles from './button.stories.css';

export default {
  title: 'UI/Button',
  component: Button,
} satisfies Meta<ButtonProps>;

const types: ButtonProps['variant'][] = [
  'primary',
  'secondary',
  'plain',
  'error',
  'success',
];

const sizes: ButtonProps['size'][] = ['default', 'large', 'extraLarge'];

const Groups = ({
  children,
  ...props
}: Omit<ButtonProps, 'variant' | 'size'>) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <td>Type/Size</td>
          {sizes.map(size => (
            <td key={size}>{size}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        {types.map(type => (
          <tr key={type}>
            <td>{type}</td>
            {sizes.map(size => (
              <td key={size}>
                <Button variant={type} size={size} {...props}>
                  {children ?? `${size} - ${type}`}
                </Button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const Default = () => <Groups />;

export const WithIcon = () => {
  return <Groups prefix={<FolderIcon />} suffix={<span>🚀</span>} />;
};

export const Loading = () => {
  const [loading, setLoading] = useState(false);
  const toggleLoading = useCallback(() => setLoading(v => !v), []);

  useEffect(() => {
    const interval = setInterval(toggleLoading, 1000);
    return () => clearInterval(interval);
  }, [toggleLoading]);

  return <Groups loading={loading} prefix={<FolderIcon />} />;
};

type OverrideKey =
  | 'bg'
  | 'textColor'
  | 'border'
  | 'fontSize'
  | 'prefixSize'
  | 'suffixSize'
  | 'prefixColor'
  | 'suffixColor';

type OverrideState = Record<OverrideKey, boolean>;

const initialOverrides: OverrideState = {
  bg: false,
  textColor: false,
  border: false,
  fontSize: false,
  prefixSize: false,
  suffixSize: false,
  prefixColor: false,
  suffixColor: false,
};

function overrideReducer(state: OverrideState, key: OverrideKey) {
  return { ...state, [key]: !state[key] };
}

export const OverrideViaClassName = () => {
  const [overrides, dispatch] = useReducer(overrideReducer, initialOverrides);

  const toggle = (key: OverrideKey) => dispatch(key);

  return (
    <div>
      <div className={styles.settings}>
        {(
          [
            ['Override background color', 'bg'],
            ['Override text color', 'textColor'],
            ['Override border color', 'border'],
            ['Override font size', 'fontSize'],
            ['Override prefix size', 'prefixSize'],
            ['Override suffix size', 'suffixSize'],
            ['Override prefix color', 'prefixColor'],
            ['Override suffix color', 'suffixColor'],
          ] as const
        ).map(([label, key]) => (
          <section key={key}>
            <span>{label}</span>
            <Switch checked={overrides[key]} onChange={() => toggle(key)} />
          </section>
        ))}
      </div>

      <Groups
        prefix={<FolderIcon />}
        suffix={<ArrowRightBigIcon />}
        className={clsx({
          [styles.overrideBackground]: overrides.bg,
          [styles.overrideTextColor]: overrides.textColor,
          [styles.overrideBorder]: overrides.border,
          [styles.overrideFontSize]: overrides.fontSize,
        })}
        prefixClassName={clsx({
          [styles.overrideIconSize]: overrides.prefixSize,
          [styles.overrideIconColor]: overrides.prefixColor,
        })}
        suffixClassName={clsx({
          [styles.overrideIconSize]: overrides.suffixSize,
          [styles.overrideIconColor]: overrides.suffixColor,
        })}
      />
    </div>
  );
};

export const FixedWidth = () => {
  const widths = [60, 100, 120, 160, 180];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {widths.map(width => (
        <Button prefix={<AfFiNeIcon />} key={width} style={{ width }}>
          This is a width fixed button
        </Button>
      ))}
    </div>
  );
};

export const Disabled = () => {
  return <Groups disabled />;
};
