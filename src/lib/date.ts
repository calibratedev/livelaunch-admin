import moment from "moment"

export const formatDate = (date?: number | string, format: string = 'MMM DD, YYYY') => {
  if(!date) return ''
  
  if(typeof date === 'number') {
    return moment.unix(date).format(format)
  }
  return moment(date).format(format)
}