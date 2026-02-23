'use client';

import React from 'react';

interface LoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({ className = '', size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'loader-sm' : size === 'lg' ? 'loader-lg' : '';
  return <span className={`loader ${sizeClass} ${className}`}></span>;
};

