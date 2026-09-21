abbastanza = ARGV[0] || "Essentials FRLG/Data/Scripts.rxdata"
require 'zlib'

data = Marshal.load(File.open(abbastanza, 'rb'))
out_dir = File.join(File.dirname(__FILE__), 'scripts_estratti')
Dir.mkdir(out_dir) unless Dir.exist?(out_dir)

index = []
data.each_with_index do |entry, i|
  id, nome, compressi = entry
  begin
    testo = Zlib::Inflate.inflate(compressi)
    testo.force_encoding('UTF-8')
  rescue => e
    testo = "# ERRORE decompressione: #{e.message}"
  end
  nome_pulito = nome.to_s.gsub(/[^A-Za-z0-9_]/, '_')
  fname = format('%04d_%s.rb', i, nome_pulito)
  File.write(File.join(out_dir, fname), testo)
  index << "#{i}\t#{id}\t#{nome}"
end

File.write(File.join(out_dir, '_index.txt'), index.join("\n"))
puts "Estratti #{data.length} script in #{out_dir}"
