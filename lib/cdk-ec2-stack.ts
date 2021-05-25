import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2'


export class CdkEc2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lab_vpc = new ec2.Vpc(this, 'lab-vpc',{
      cidr: "10.10.0.0/16",
      natGateways: 1,
      subnetConfiguration: [{
        cidrMask: 26,
        name: "lab-private-subnet-1",
        subnetType: ec2.SubnetType.PRIVATE
      },
      { 
        cidrMask: 26,
        name: "lab-public-subnet-1",
        subnetType: ec2.SubnetType.PUBLIC
      }]
    });
    
    // const lab_pub_sub_1 = new ec2.Subnet(this, 'lab-public-subnet-1', {
    //   availabilityZone: 'us-east-1a',
    //   vpcId: lab_vpc.vpcId,
    //   cidrBlock: '10.0.10.0/24'
    // })

    // const lab_priv_sub_1 = new ec2.Subnet(this, 'lab-private-subnet-1', {
    //   availabilityZone: 'us-east-1a',
    //   vpcId: lab_vpc.vpcId,
    //   cidrBlock: '10.10.11.0/24'
    // })

    const lab_sg = new ec2.SecurityGroup(this, 'lab-security-group', {
      vpc: lab_vpc,
      allowAllOutbound: true,
      securityGroupName: 'lab-security-group',
    })

    lab_sg.addIngressRule(
      ec2.Peer.ipv4('47.212.113.82/32'),
      ec2.Port.allTraffic(),
      'Allow all traffic from your IP to the VPC.'
    )
    
    const amzn_linux = new ec2.Instance(this, 'sample-ec2-instance', {
      vpc: lab_vpc,
      securityGroup: lab_sg,
      instanceName: 'sample-ec2-instance',
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),

      keyName: 'lab-key',

    })

    new cdk.CfnOutput(this, 'lab-build-output', {
      value: amzn_linux.instancePublicIp
    })
    




  }
}
