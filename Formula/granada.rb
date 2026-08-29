class Granada < Formula
  desc "Vendor-neutral software factory: spec review, implementation, and change visualization"
  homepage "https://github.com/daskinnyman/granada-release"
  url "https://github.com/daskinnyman/granada-release/releases/download/v0.3.0/granada-0.3.0.tgz"
  sha256 "0585e1685e953fcaf7ba33472b3aad2ff1e5aeb7fb439698ff9dc29fbdc6cdbe"
  version "0.3.0"

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
