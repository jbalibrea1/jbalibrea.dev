export interface DateTimeProps {
  pubDateTime: string | Date;
  modDateTime: string | Date | undefined | null;
  size?: 'sm' | 'lg';
  className?: string;
}
