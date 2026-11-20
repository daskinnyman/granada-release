class Granada < Formula
  desc "Host-native software factory: one-line intent in, merge-ready draft PR out, run from inside your agent CLI"
  homepage "https://github.com/daskinnyman/granada-release"
  url "https://github.com/daskinnyman/granada-release/releases/download/v0.12.88/granada-0.12.88.tgz"
  sha256 "f556978c3a7d7c28cf93ae1d61d202b16cd3726925e2fa250ae8943c4d5c3fdf"
  version "0.12.88"

  depends_on "node"

  def install
    # Release tarball already contains dist/. Drop the build toolchain (not typescript: Stryker imports it) so
    # Homebrew does not rewrite tsdown → yuku-codegen Mach-O install names.
    require "json"
    pkg = JSON.parse((buildpath/"package.json").read)
    %w[tsdown tsx].each { |name| pkg["dependencies"]&.delete(name) }
    (buildpath/"package.json").atomic_write(JSON.pretty_generate(pkg) + "\n")
    system "npm", "install", "--ignore-scripts", "--omit=dev", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    output = shell_output("#{bin}/granada 2>&1", 1)
    assert_match "Usage: granada", output
  end
end
