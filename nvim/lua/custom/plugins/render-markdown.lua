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
      icons = {},
      backgrounds = {},
    },
    code = {
      enabled = true,
      sign = false,
      style = 'full',
    },
    bullet = {
      enabled = true,
      icons = { '•' },
    },
    checkbox = {
      enabled = true,
    },
    pipe_table = {
      enabled = true,
      style = 'full',
    },
    link = {
      enabled = true,
    },
  },
  config = function(_, opts)
    -- Strip all color from markdown — just bold/plain text
    local plain = { fg = 'NONE', bg = 'NONE', bold = true }
    local none = { fg = 'NONE', bg = 'NONE' }
    for _, level in ipairs { '1', '2', '3', '4', '5', '6' } do
      vim.api.nvim_set_hl(0, 'RenderMarkdownH' .. level, plain)
      vim.api.nvim_set_hl(0, 'RenderMarkdownH' .. level .. 'Bg', none)
    end
    vim.api.nvim_set_hl(0, 'RenderMarkdownCode', none)
    vim.api.nvim_set_hl(0, 'RenderMarkdownCodeInline', none)
    vim.api.nvim_set_hl(0, 'RenderMarkdownBullet', none)
    vim.api.nvim_set_hl(0, 'RenderMarkdownTableHead', none)
    vim.api.nvim_set_hl(0, 'RenderMarkdownTableRow', none)
    vim.api.nvim_set_hl(0, 'RenderMarkdownTableFill', none)
    vim.api.nvim_set_hl(0, 'RenderMarkdownChecked', none)
    vim.api.nvim_set_hl(0, 'RenderMarkdownUnchecked', none)
    vim.api.nvim_set_hl(0, 'RenderMarkdownQuote', none)
    vim.api.nvim_set_hl(0, 'RenderMarkdownDash', none)

    require('render-markdown').setup(opts)
  end,
}
