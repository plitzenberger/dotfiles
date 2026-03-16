" Detect .base files as YAML
augroup ftdetect_base
  autocmd!
  autocmd BufNewFile,BufRead *.base setfiletype yaml
augroup END