import {html} from 'lit';
import type {Meta, StoryObj} from '@storybook/web-components';
import '@pie-wc/shared';
import '@pie-wc/multiple-choice-question';
import item from './data/item-cc036ed6-3022-4496-8fb5-e7e3cdfa2af7.json';
import {Env} from "@pie-wc/shared";

type MultipleChoiceArgs = {
    mode?: 'gather' | 'view' | 'evaluate';
    role?: 'instructor' | 'student';
    choiceMode?: 'checkbox' | 'radio';
    choicePrefix?: 'letters' | 'numbers';
    promptEnabled?: boolean;
}

const meta: Meta<MultipleChoiceArgs> = {
    component: 'pie-multiple-choice-test',
    argTypes: {
        mode: {
            options: ['gather', 'view', 'evaluate'],
            control: {type: 'select'},
            defaultValue: 'gather',
            description: 'The interaction mode'
        },
        role: {
            options: ['instructor', 'student'],
            control: {type: 'select'},
            defaultValue: 'student',
            description: 'The role of the user'
        },
        choiceMode: {
            options: ['checkbox', 'radio'],
            control: {type: 'select'},
            defaultValue: item.config.models[0].choiceMode || 'checkbox',
            description: 'Indicates the choices are single or multiple selection'
        },
        choicePrefix: {
            options: ['letters', 'numbers'],
            control: {type: 'select'},
            defaultValue: item.config.models[0].choicePrefix || 'letters',
            description: 'What key should be displayed before choices. If undefined no  key will be displayed.'
        },
        promptEnabled: {
            control: {type: 'boolean'},
            description: 'Should prompt be displayed?',
            defaultValue: item.config.models[0].promptEnabled || true
        }
    },
};
export default meta;

type Story = StoryObj;

export const PlainWithScoringPanel: Story = {
    args: {
        mode: 'gather',
        role: 'student',
    },
    render: (args: MultipleChoiceArgs) => {
        const env = {mode: args.mode, role: args.role} as Env;
        return html`
            <pie-container .env=${env}>
                <pie-item-container .item=${item}>
                    <pie-multiple-choice>
                    </pie-multiple-choice>
                    <br/>
                    <pie-auto-score-container>
                        <pie-auto-score-display>
                        </pie-auto-score-display>
                    </pie-auto-score-container>
                </pie-item-container>
            </pie-container>
        `;
    }
};

