const theme = require('../src/theme')

module.exports = {
  new: {
    label: 'New',
    description: 'This is a relatively new feature, and may be subject to dramatic changes.',
    color: theme.colors['yellow-4']
  },
  wip: {
    label: 'In progress',
    description: 'Under development, and/or likely to change.',
    color: theme.colors['purple-3']
  },
  stable: {
    label: 'Stable',
    description: 'This feature is unlikely to change.',
    color: theme.colors['green-3']
  },
  deprecated: {
    label: 'Deprecated',
    description: 'This feature has been removed in the current version.',
    color: theme.colors['red-3']
  },
  unknown: {
    label: 'Unknown',
    description: 'This status of this feature or pattern is unknown. Tread with caution!',
    color: theme.colors['dark-grey']
  }
}
