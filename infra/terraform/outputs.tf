# infra/terraform/outputs.tf
output "ec2_public_ip" {
  value = module.deepchain_ec2.public_ip
}

output "s3_bucket_endpoint" {
  value = module.deepchain_s3.bucket_domain_name
}