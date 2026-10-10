class Granada < Formula
  desc "Host-native software factory: one-line intent in, merge-ready draft PR out, run from inside your agent CLI"
  homepage "https://github.com/daskinnyman/granada-release"
  url "https://github.com/daskinnyman/granada-release/releases/download/v0.12.27/granada-0.12.27.tgz"
  sha256 "2372c70f32b8a68302a89e6e15423f0e5f2f8bf6002b519d73c6095d0fe67b60"
  version "0.12.27"

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
