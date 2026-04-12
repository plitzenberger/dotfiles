return {
  'epwalsh/obsidian.nvim',
  version = '*',
  lazy = true,
  ft = 'markdown',
  dependencies = {
    'nvim-lua/plenary.nvim',
    'hrsh7th/nvim-cmp',
    'nvim-telescope/telescope.nvim',
  },
  opts = {
    workspaces = {
      {
        name = 'LifeOS',
        path = '~/Documents/plitzenberger/LifeOS',
      },
    },

    completion = {
      nvim_cmp = true,
      min_chars = 2,
    },

    new_notes_location = '/',
    preferred_link_style = 'wiki',

    daily_notes = {
      folder = 'daily',
      date_format = '%Y-%m-%d',
      alias_format = '%B %-d, %Y',
      default_tags = { 'daily-notes' },
      template = nil,
    },

    templates = {
      folder = 'Templates',
      date_format = '%Y-%m-%d',
      time_format = '%H:%M',
    },

    note_id_func = function(title)
      if title ~= nil then
        return title:gsub(' ', '-'):gsub('[^A-Za-z0-9-]', ''):lower()
      end

      return tostring(os.time())
    end,
  },
  config = function(_, opts)
    require('obsidian').setup(opts)

    vim.keymap.set('n', '<leader>on', '<cmd>ObsidianNew<CR>', { desc = '[O]bsidian [N]ew note' })
    vim.keymap.set('n', '<leader>oo', '<cmd>ObsidianOpen<CR>', { desc = '[O]bsidian [O]pen in app' })
    vim.keymap.set('n', '<leader>of', '<cmd>ObsidianQuickSwitch<CR>', { desc = '[O]bsidian [F]ind note' })
    vim.keymap.set('n', '<leader>od', '<cmd>ObsidianToday<CR>', { desc = '[O]bsidian [D]aily note' })
    vim.keymap.set('n', '<leader>ot', '<cmd>ObsidianTags<CR>', { desc = '[O]bsidian [T]ags' })
    vim.keymap.set('n', '<leader>ob', '<cmd>ObsidianBacklinks<CR>', { desc = '[O]bsidian [B]acklinks' })
  end,
}
