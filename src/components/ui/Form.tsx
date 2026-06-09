import React from 'react';

interface FormFieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label, htmlFor, hint, error, required, children, className = '',
}) => (
  <div className={`form-group ${className}`}>
    {label && (
      <label htmlFor={htmlFor} className="form-label">
        {label}
        {required && <span className="text-danger ml-0.5" aria-hidden>*</span>}
      </label>
    )}
    {children}
    {hint && !error && <span className="form-hint">{hint}</span>}
    {error && <span className="form-error">{error}</span>}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const inputSizeClass = { sm: 'input-sm', md: '', lg: 'input-lg' };

export const Input: React.FC<InputProps> = ({
  invalid, leftIcon, rightSlot, size = 'md', className = '', ...rest
}) => {
  const cls = [
    'input',
    inputSizeClass[size],
    invalid ? 'border-danger' : '',
    className,
  ].filter(Boolean).join(' ');

  if (leftIcon || rightSlot) {
    return (
      <div className="input-with-icon">
        {leftIcon && <span className="input-icon">{leftIcon}</span>}
        <input className={cls} {...rest} />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {rightSlot}
          </span>
        )}
      </div>
    );
  }

  return <input className={cls} {...rest} />;
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ invalid, className = '', ...rest }) => (
  <textarea className={`input ${invalid ? 'border-danger' : ''} ${className}`} {...rest} />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select: React.FC<SelectProps> = ({ invalid, className = '', children, ...rest }) => (
  <select className={`input ${invalid ? 'border-danger' : ''} ${className}`} {...rest}>
    {children}
  </select>
);

export default FormField;
