import { SiFacebook, SiInstagram } from 'react-icons/si';
import { Link } from '@tanstack/react-router';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">© {currentYear}</div>

          <div className="flex items-center gap-6">
            <Link
              to="/fitness-metrics"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Fitness Metrics
            </Link>
            <Link
              to="/lifestyle-survey"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Lifestyle Survey
            </Link>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/hellchallenge_peter/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Follow on Instagram"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/peter.smrcak"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Follow on Facebook"
              >
                <SiFacebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
