import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  animate = false,
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    medical: 'bg-medical-100 text-medical-800 border-medical-200',
    
    // Variantes pour les urgences
    critique: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
    prioritaire: 'bg-orange-100 text-orange-800 border-orange-200',
    standard: 'bg-gray-100 text-gray-800 border-gray-200',
    
    // Variantes pour les statuts
    attente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    appele: 'bg-blue-100 text-blue-800 border-blue-200',
    'en_consultation': 'bg-green-100 text-green-800 border-green-200',
    termine: 'bg-gray-100 text-gray-800 border-gray-200',
    annule: 'bg-red-100 text-red-800 border-red-200'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  }

  const Component = animate ? motion.span : 'span'
  const animationProps = animate ? {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  } : {}

  return (
    <Component
      className={clsx(
        'inline-flex items-center font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
      {...animationProps}
    >
      {children}
    </Component>
  )
}

// Composants spécialisés
export const UrgenceBadge = ({ niveau, ...props }) => (
  <Badge variant={niveau} {...props}>
    {niveau === 'critique' && 'Critique'}
    {niveau === 'prioritaire' && 'Prioritaire'}
    {niveau === 'standard' && 'Standard'}
  </Badge>
)

export const StatutBadge = ({ statut, ...props }) => {
  const labels = {
    attente: 'En attente',
    appele: 'Appelé',
    en_consultation: 'En consultation',
    termine: 'Terminé',
    annule: 'Annulé'
  }

  return (
    <Badge variant={statut} {...props}>
      {labels[statut] || statut}
    </Badge>
  )
}

export default Badge