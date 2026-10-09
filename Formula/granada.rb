class Granada < Formula
  desc "Host-native software factory: one-line intent in, merge-ready draft PR out, run from inside your agent CLI"
  homepage "https://github.com/daskinnyman/granada-release"
  url "https://github.com/daskinnyman/granada-release/releases/download/v0.12.25/granada-0.12.25.tgz"
  sha256 "5581024af45aed334f8e5b9420f4ec3566c1ccbb02019db0469fb799356e1725"
  version "0.12.25"

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
