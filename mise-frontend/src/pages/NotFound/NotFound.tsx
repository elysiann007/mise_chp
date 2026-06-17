import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import { fadeUp, stagger } from '../../lib/animations'

export default function NotFound() {
  return (
    <PageWrapper>
      <main className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-5 pt-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div
            variants={fadeUp}
            className="font-display text-amber-400/15 select-none leading-none"
            style={{ fontSize: 'clamp(8rem, 35vw, 20rem)', letterSpacing: '0.04em' }}
          >
            404
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-stone-900 dark:text-white -mt-4 mb-4"
            style={{ fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', letterSpacing: '0.12em' }}
          >
            PAGE NOT FOUND
          </motion.h1>

          <motion.p variants={fadeUp} className="text-stone-500 dark:text-zinc-500 text-sm mb-10 max-w-xs mx-auto leading-relaxed">
            Looks like this smoke dissolved. Let's get you back to something real.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-8 py-3.5 bg-amber-400 text-stone-950 font-bold text-xs tracking-[0.2em] uppercase rounded-full hover:bg-amber-300 transition-all duration-300 hover:shadow-xl hover:shadow-amber-400/25"
            >
              Back to Home
            </Link>
            <Link
              to="/menu"
              className="px-8 py-3.5 border border-stone-300 dark:border-zinc-700 text-stone-600 dark:text-zinc-400 font-semibold text-xs tracking-[0.2em] uppercase rounded-full hover:border-amber-500/50 dark:hover:border-amber-400/50 hover:text-stone-900 dark:hover:text-white transition-all duration-300"
            >
              View Menu
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </PageWrapper>
  )
}
