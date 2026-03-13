return {
  'MeanderingProgrammer/render-markdown.nvim',
  dependencies = {
    'nvim-treesitter/nvim-treesitter',
    'nvim-tree/nvim-web-devicons',
  },
  ft = { 'markdown' },
  opts = {
    heading = {
      enabled = true,
      sign = true,
      icons = { '󰲡 ', '󰲣 ', '󰲥 ', '󰲧 ', '󰲩 ', '󰲫 ' },
    },
    code = {
      enabled = true,
      sign = true,
      style = 'full',
    },
    bullet = {
      enabled = true,
      icons = { '●', '○', '◆', '◇' },
    },
    checkbox = {
      enabled = true,
    },
    pipe_table = {
      enabled = true,
      style = 'full',
    },
  },
}
