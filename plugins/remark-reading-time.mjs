import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingStats = getReadingTime(textOnPage);
    const roundedMinutes = Math.max(1, Math.round(readingStats.minutes));

    data.astro.frontmatter.minutesRead = `${roundedMinutes} min${roundedMinutes > 1 ? 's' : ''} de lectura`;
  };
}
