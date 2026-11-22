import type { DateTimeProps } from '@interfaces/DateTime';
import { formattedDate } from '@utils/formattedDateTime';

export default function Datetime({
  pubDateTime,
  modDateTime,
  size = 'sm',
  className = '',
}: DateTimeProps) {
  return (
    <div className="flex flex-col items-start md:items-end">
      <div
        className={`flex items-center space-x-2 opacity-80 ${className}`.trim()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${
            size === 'sm' ? 'scale-40' : 'scale-100'
          } inline-block h-6 w-6 fill-black dark:fill-white`}
          aria-hidden="true"
        >
          <path d="M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"></path>
          <path d="M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z"></path>
        </svg>

        <span className={`italic ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
          <FormattedDatetime
            pubDateTime={pubDateTime}
            modDateTime={modDateTime}
            stacked
          />
        </span>
      </div>
    </div>
  );
}

/** ¿Se editó el post en un día distinto al de publicación? */
export const isUpdated = (
  pubDateTime: string | Date,
  modDateTime: string | Date | undefined | null,
): modDateTime is string | Date =>
  !!modDateTime &&
  formattedDate(new Date(modDateTime)) !==
    formattedDate(new Date(pubDateTime)) &&
  new Date(modDateTime) > new Date(pubDateTime);

const DateItem = ({ label, date }: { label: string; date: Date }) => (
  <>
    <span>{label}</span>{' '}
    <time dateTime={date.toISOString()}>{formattedDate(date)}</time>
  </>
);

/**
 * Fecha de publicación y, si existe, la de actualización.
 * `stacked`: una debajo de la otra (tarjetas); si no, en línea separadas por «·».
 */
export const FormattedDatetime = ({
  pubDateTime,
  modDateTime,
  stacked = false,
}: Pick<DateTimeProps, 'pubDateTime' | 'modDateTime'> & {
  stacked?: boolean;
}) => {
  const pub = new Date(pubDateTime);
  const updated = isUpdated(pubDateTime, modDateTime);
  const Wrapper = stacked ? 'div' : 'span';

  return (
    <>
      <Wrapper>
        <DateItem label="Publicado:" date={pub} />
      </Wrapper>
      {updated && (
        <>
          {!stacked && <span aria-hidden="true"> · </span>}
          <Wrapper className={stacked ? 'text-xs' : undefined}>
            <DateItem label="Actualizado:" date={new Date(modDateTime)} />
          </Wrapper>
        </>
      )}
    </>
  );
};
