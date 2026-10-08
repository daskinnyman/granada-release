class Granada < Formula
  desc "Host-native software factory: one-line intent in, merge-ready draft PR out, run from inside your agent CLI"
  homepage "https://github.com/daskinnyman/granada-release"
  url "https://github.com/daskinnyman/granada-release/releases/download/v0.12.19/granada-0.12.19.tgz"
  sha256 "87b157d66e6ffa1c63657ae60ca5d20fd9acb8e4a825e5927ca623a8d4fe16f7"
  version "0.12.19"

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
