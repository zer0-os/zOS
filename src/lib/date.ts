import moment from 'moment';

export function displayDate(theDate: string) {
  return theDate ? moment(theDate).format('MMM D, YYYY') : '';
}

export function displayDateShort(theDate: string) {
  return theDate ? moment(theDate).format('MM.DD.YY') : '';
}

export function displayDateLong(theDate: string | number) {
  return theDate ? moment(theDate).format('MMMM D, YYYY') : '';
}

export function displayDateTime(theTime: number | string | Date) {
  return theTime ? moment(theTime).format('LLL') : '';
}

export function fromNow(theTime: string | Date) {
  return theTime ? moment(theTime).fromNow() : '';
}

export function yearsSince(theDate: string) {
  return Math.abs(moment(theDate).diff(Date.now(), 'years'));
}

export function monthsSince(theDate: string) {
  return Math.abs(moment(theDate).diff(Date.now(), 'months'));
}

export function compareDatesDesc(a: string | number | Date, b: string | number | Date) {
  const BEGINNING_OF_TIME = '1000-01-01';
  return -moment(a || BEGINNING_OF_TIME).diff(moment(b || BEGINNING_OF_TIME));
}

export function sortByCreatedAtDesc(a, b) {
  return compareDatesDesc(a.createdAt, b.createdAt);
}

export function timeUntil(current, target) {
  const currentMoment = moment(current);
  const targetMoment = moment(target);
  const duration = moment.duration(targetMoment.diff(currentMoment));

  if (duration.asMilliseconds() <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(duration.asDays()),
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds(),
  };
}
