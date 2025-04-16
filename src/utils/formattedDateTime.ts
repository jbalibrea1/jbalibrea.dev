function formattedDate(myDatetime: Date) {
  const date = myDatetime.toLocaleDateString(['es-ES'], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  return date;
}

function formattedTime(myDatetime: Date) {
  const time = myDatetime.toLocaleTimeString(['es-ES'], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return time;
}

export { formattedDate, formattedTime };
