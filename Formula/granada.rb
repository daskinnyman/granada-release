class Granada < Formula
  desc "Vendor-neutral software factory: spec review, implementation, and change visualization"
  homepage "https://github.com/daskinnyman/granada-release"
  url "https://github.com/daskinnyman/granada-release/releases/download/v0.9.1/granada-0.9.1.tgz"
  sha256 "3e1236caa1ae72674daaa82b819c18ae4d654b003a656f9b144cc8c1e317280c"
  version "0.9.1"

  depends_on "node"

  def install
    # Release tarball already contains dist/. Drop the build toolchain so
    # Homebrew does not rewrite tsdown → yuku-codegen Mach-O install names.
    require "json"
    pkg = JSON.parse((buildpath/"package.json").read)
    %w[tsdown tsx typescript].each { |name| pkg["dependencies"]&.delete(name) }
    (buildpath/"package.json").atomic_write(JSON.pretty_generate(pkg) + "\n")
    system "npm", "install", "--ignore-scripts", "--omit=dev", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    output = shell_output("#{bin}/granada 2>&1", 1)
    assert_match "Usage: granada", output
  end
end
