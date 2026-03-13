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
      sign = false,
      icons = { '󰲡 ', '󰲣 ', '󰲥 ', '󰲧 ', '󰲩 ', '󰲫 ' },
      backgrounds = {},
      foregrounds = {
        'RenderMarkdownH1',
        'RenderMarkdownH2',
        'RenderMarkdownH3',
        'RenderMarkdownH4',
        'RenderMarkdownH5',
        'RenderMarkdownH6',
      },
    },
    on_attach = function(bufnr)
      -- Subtle heading style: just bold text, no background highlighting
      local subtle = { bold = true, bg = 'NONE' }
      vim.api.nvim_set_hl(0, 'RenderMarkdownH1Bg', subtle)
      vim.api.nvim_set_hl(0, 'RenderMarkdownH2Bg', subtle)
      vim.api.nvim_set_hl(0, 'RenderMarkdownH3Bg', subtle)
      vim.api.nvim_set_hl(0, 'RenderMarkdownH4Bg', subtle)
      vim.api.nvim_set_hl(0, 'RenderMarkdownH5Bg', subtle)
      vim.api.nvim_set_hl(0, 'RenderMarkdownH6Bg', subtle)
    end,
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
