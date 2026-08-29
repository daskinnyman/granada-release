class Granada < Formula
  desc "Vendor-neutral software factory: spec review, implementation, and change visualization"
  homepage "https://github.com/daskinnyman/granada-release"
  url "https://github.com/daskinnyman/granada-release/releases/download/v0.4.0/granada-0.4.0.tgz"
  sha256 "717ae51180e4817e69ee91ddee749e64acb1c2d1c27a804a7f341ea164993a19"
  version "0.4.0"

  depends_on "node"

  def install
    system "npm", "install", "--ignore-scripts", "--omit=dev", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    output = shell_output("#{bin}/granada 2>&1", 1)
    assert_match "Usage: granada", output
  end
end
