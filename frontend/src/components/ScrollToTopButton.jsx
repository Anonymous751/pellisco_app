import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    // Using window.scrollY as pageYOffset is technically deprecated
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={scrollToTop}
        className={`
          flex items-center justify-center
          w-12 h-12 rounded-full shadow-2xl
          /* Pelisco Theme Colors */
          bg-[var(--color-primary)] text-white
          border border-[var(--color-mutedGreen)]/20

          transition-all duration-500 ease-in-out
          /* Hover State using Secondary Color */
          hover:bg-[var(--color-secondary)] hover:-translate-y-2
          active:scale-90

          /* Visibility Logic */
          ${isVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
        aria-label="Scroll to top"
      >
        <ChevronUp size={22} strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default ScrollToTopButton;
