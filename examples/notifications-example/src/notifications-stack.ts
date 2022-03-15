import { SlackChannelConfiguration, MSTeamsIncomingWebhookConfiguration, AccountLabelMode } from '@cloudcomponents/cdk-chatops';
import {
  RepositoryNotificationRule,
  PipelineNotificationRule,
  RepositoryEvent,
  PipelineEvent,
  SlackChannel,
  MSTeamsIncomingWebhook,
} from '@cloudcomponents/cdk-developer-tools-notifications';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { Pipeline, Artifact } from 'aws-cdk-lib/aws-codepipeline';
import { CodeCommitSourceAction, ManualApprovalAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Construct } from 'constructs';

export class NotificationsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const repository = new Repository(this, 'Repository', {
      repositoryName: 'notifications-repository',
    });

    if (typeof process.env.SLACK_WORKSPACE_ID === 'undefined') {
      throw new Error('environment variable SLACK_WORKSPACE_ID undefined');
    }
    if (typeof process.env.SLACK_CHANNEL_ID === 'undefined') {
      throw new Error('environment variable SLACK_CHANNEL_ID undefined');
    }
    const slackChannel = new SlackChannelConfiguration(this, 'SlackChannel', {
      slackWorkspaceId: process.env.SLACK_WORKSPACE_ID,
      configurationName: 'notifications',
      slackChannelId: process.env.SLACK_CHANNEL_ID,
    });

    if (typeof process.env.INCOMING_WEBHOOK_URL === 'undefined') {
      throw new Error('environment variable INCOMING_WEBHOOK_URL undefined');
    }
    const webhook = new MSTeamsIncomingWebhookConfiguration(this, 'MSTeamsWebhook', {
      url: process.env.INCOMING_WEBHOOK_URL,
      accountLabelMode: AccountLabelMode.ID_AND_ALIAS,
      themeColor: '#FF0000',
    });

    new RepositoryNotificationRule(this, 'RepoNotifications', {
      name: 'notifications-repository',
      repository,
      events: [RepositoryEvent.COMMENTS_ON_COMMITS, RepositoryEvent.PULL_REQUEST_CREATED, RepositoryEvent.PULL_REQUEST_MERGED],
      targets: [new SlackChannel(slackChannel), new MSTeamsIncomingWebhook(webhook)],
    });

    const sourceArtifact = new Artifact();

    const sourceAction = new CodeCommitSourceAction({
      actionName: 'CodeCommit',
      repository,
      output: sourceArtifact,
    });

    const approvalAction = new ManualApprovalAction({
      actionName: 'Approval',
    });

    const pipeline = new Pipeline(this, 'Pipeline', {
      pipelineName: 'notifications-pipeline',
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Approval',
          actions: [approvalAction],
        },
      ],
    });

    new PipelineNotificationRule(this, 'PipelineNotificationRule', {
      name: 'pipeline-notification',
      pipeline,
      events: [
        PipelineEvent.PIPELINE_EXECUTION_STARTED,
        PipelineEvent.PIPELINE_EXECUTION_FAILED,
        PipelineEvent.PIPELINE_EXECUTION_SUCCEEDED,
        // PipelineEvent.ACTION_EXECUTION_STARTED,
        // PipelineEvent.ACTION_EXECUTION_SUCCEEDED,
        // PipelineEvent.ACTION_EXECUTION_FAILED,
        PipelineEvent.MANUAL_APPROVAL_NEEDED,
        PipelineEvent.MANUAL_APPROVAL_SUCCEEDED,
        // PipelineEvent.MANUAL_APPROVAL_FAILED,
        // PipelineEvent.STAGE_EXECUTION_STARTED,
        // PipelineEvent.STAGE_EXECUTION_SUCCEEDED,
        // PipelineEvent.STAGE_EXECUTION_FAILED,
      ],
      targets: [new SlackChannel(slackChannel), new MSTeamsIncomingWebhook(webhook)],
    });
  }
}
