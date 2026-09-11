class Granada < Formula
  desc "Vendor-neutral software factory: spec review, implementation, and change visualization"
  homepage "https://github.com/daskinnyman/granada-release"
  url "https://github.com/daskinnyman/granada-release/releases/download/v0.10.5/granada-0.10.5.tgz"
  sha256 "23696fbfc9d39c957b7d5ae6b8d84b6f80d2e8b82813fdb8ffc8e98ff4bf70b6"
  version "0.10.5"

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
