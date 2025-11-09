import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const variants = {
    primary: 'bg-medical-500 hover:bg-medical-600 text-white border-transparent focus:ring-medical-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 focus:ring-gray-500',
    success: 'bg-green-500 hover:bg-green-600 text-white border-transparent focus:ring-green-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent focus:ring-yellow-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white border-transparent focus:ring-red-500',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 focus:ring-medical-500',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 border-transparent focus:ring-gray-500'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  const baseClasses = clsx(
    'inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  )

  const handleClick = (e) => {
    if (disabled || loading) return
    onClick?.(e)
  }

  return (
    <motion.button
      type={type}
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading ? (
        <>
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          Chargement...
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {children}
        </>
      )}
    </motion.button>
  )
}

// Composants spécialisés
export const IconButton = ({ 
  icon: Icon, 
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props 
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonSizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  }

  return (
    <Button
      variant={variant}
      className={clsx('!px-0 !py-0', buttonSizes[size], className)}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  )
}

export const ButtonGroup = ({ children, className = '' }) => (
  <div className={clsx('inline-flex rounded-lg shadow-sm', className)}>
    {React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child
      
      const isFirst = index === 0
      const isLast = index === React.Children.count(children) - 1
      
      return React.cloneElement(child, {
        className: clsx(
          child.props.className,
          !isFirst && 'ml-0 rounded-l-none',
          !isLast && 'rounded-r-none',
          !isFirst && 'border-l-0'
        )
      })
    })}
  </div>
)

export default Button