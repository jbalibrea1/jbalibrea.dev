export interface TimelineItem {
  id: string;
  period: string;
  title: string;
  description: string;
  hasButton?: boolean;
  buttonText?: string;
  buttonHref?: string;
  isLast?: boolean;
  achievement?: string;
  technologies?: string[];
}
