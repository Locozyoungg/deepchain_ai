# infra/terraform/variables.tf
variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-west-2"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "g4dn.xlarge" # GPU-optimized
}

variable "bucket_name" {
  description = "S3 bucket for model storage"
  type        = string
  default     = "deepchain-models"
}