import type { DateTimeProps } from '@interfaces/DateTime';
import { formattedDate, formattedTime } from '@utils/formattedDateTime';

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
          />
        </span>
      </div>
      {modDateTime && modDateTime > pubDateTime ? (
        <span className={`italic ${size === 'sm' ? 'text-xs' : 'text-base'}`}>
          Última actualización
        </span>
      ) : (
        <span className="sr-only">Publicado</span>
      )}
    </div>
  );
}

export const FormattedDatetime = ({
  pubDateTime,
  modDateTime,
}: DateTimeProps) => {
  const myDatetime = new Date(
    modDateTime && modDateTime > pubDateTime ? modDateTime : pubDateTime,
  );

  const date = formattedDate(myDatetime);
  const time = formattedTime(myDatetime);

  return (
    <>
      <time dateTime={myDatetime.toISOString()}>{date}</time>
      <span className="sr-only">&nbsp;at&nbsp;</span>
      <span className="text-nowrap sr-only">{time}</span>
    </>
  );
};
