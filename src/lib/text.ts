import { titleCase } from 'title-case'

export const toTitleCase = (text?: string | null) => {
  if (!text) return ''
  const spacedText = text.replace(/_/g, ' ')
  return titleCase(spacedText, {
    locale: 'en',
    sentenceCase: true,
    sentenceTerminators: new Set(['.', '!', '?']),
    smallWords: new Set([
      'a',
      'an',
      'the',
      'and',
      'or',
      'but',
      'if',
      'or',
      'as',
      'at',
      'by',
      'for',
      'in',
      'of',
      'on',
      'up',
      'down',
      'off',
      'over',
      'under',
      'again',
      'further',
      'then',
      'once',
      'here',
      'there',
      'when',
      'where',
      'why',
      'how',
    ]),
  })
}

export function getInitials(first_name?: string, last_name?: string) {
  const firstInitial = first_name?.charAt(0) ?? ''
  const lastInitial = last_name?.charAt(0) ?? ''
  return (firstInitial + lastInitial).toUpperCase()
}

export function getFullName(user?: AppTypes.User | null) {
  if (!user) return ''
  return `${user.first_name} ${user.last_name}`
}
