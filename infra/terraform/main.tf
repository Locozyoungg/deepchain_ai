# infra/terraform/main.tf
terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "deepchain_ec2" {
  source = "./modules/ec2"

  instance_type    = var.instance_type
  ami_id           = var.ami_id
  security_group   = aws_security_group.deepchain_sg.id
  subnet_id        = var.subnet_id
  key_pair_name    = var.key_pair_name
}

module "deepchain_s3" {
  source = "./modules/s3"

  bucket_name      = var.bucket_name
  acl              = "private"
  versioning       = true
}

resource "aws_security_group" "deepchain_sg" {
  name_prefix = "deepchain-sg-"
  
  ingress {
    from_port   = 8545 # JSON-RPC
    to_port     = 8545
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5001 # IPFS
    to_port     = 5001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}