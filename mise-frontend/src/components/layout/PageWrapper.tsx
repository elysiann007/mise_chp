import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { pageVariants } from '../../lib/animations'

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}
