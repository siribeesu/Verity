import React from 'react'
import { Scale } from 'lucide-react'

export default function Logo({ size = 22, className = '' }) {
  return (
    <Scale size={size} className={className} strokeWidth={2.2} />
  )
}
