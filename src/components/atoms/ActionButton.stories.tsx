import type { Meta, StoryObj } from '@storybook/react';
import ActionButton from './ActionButton';

const meta = {
  title: 'Atoms/ActionButton',
  component: ActionButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#2a2a2a' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'El texto del botón/enlace',
    },
    href: {
      control: 'text',
      description: 'URL opcional para el enlace',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado',
    },
  },
} satisfies Meta<typeof ActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AsLink: Story = {
  args: {
    text: 'https://kivooapp.com/register?ref=ABC123',
    href: 'https://kivooapp.com/register?ref=ABC123',
  },
};

export const AsButton: Story = {
  args: {
    text: 'Click me',
    onClick: () => alert('Clicked!'),
  },
};

export const Disabled: Story = {
  args: {
    text: 'Disabled button',
    disabled: true,
    onClick: () => {},
  },
};

export const LongText: Story = {
  args: {
    text: 'https://kivooapp.com/register?ref=ABC12345678901234567890',
    href: 'https://kivooapp.com/register?ref=ABC12345678901234567890',
    className: 'truncate',
  },
};

