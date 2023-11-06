import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement, nothing} from "lit";
import type {Env, PieItem} from "@pie-wc/shared";
import {mkVersion, pieEnvContext, pieItemContext, SemVerHelper} from "@pie-wc/shared";
import {consume} from "@lit/context";

@customElement('pie-question-player-item-info')
export class QuestionPlayerItemInfo extends LitElement {

    @consume({context: pieEnvContext, subscribe: true})
    @property({type: Object})
    env: Env;

    @consume({context: pieItemContext, subscribe: true})
    @property({type: Object})
    item: PieItem;

    render() {
        if (!this.item) return html`
            <div>no item set</div>`;

        const version = mkVersion(
            this.item?.version?.major, this.item?.version?.minor,
            this.item?.version?.patch, this.item?.version?.prerelease?.version)

        return html`
            <table>
                <thead>
                <tr>
                    <th>property</th>
                    <th>value</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>baseId</td>
                    <td>${this.item?.baseId}</td>
                </tr>
                <tr>
                    <td>name</td>
                    <td>${this.item?.name}</td>
                </tr>
                <tr>
                    <td>version</td>
                    <td>${version ? SemVerHelper.encode(version) : nothing}</td>
                </tr>
                <tr>
                    <td>PIE elements</td>
                    <td>${(Object.values(this.item?.config?.elements || {})).join(",")}</td>
                </tr>
                </tbody>
            </table>
        `;
    }

    static styles = css`
      .mdc-card {
        padding: 16px;
        margin: 16px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      body {
        font-family: 'Roboto', sans-serif;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        margin-top: 20px;
      }

      th, td {
        padding: 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      }

      th {
        background-color: #f5f5f5;
        font-weight: 500;
      }

      td {
        font-weight: 400;
      }

      tr:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'pie-question-player-item-info': QuestionPlayerItemInfo;
    }
}

